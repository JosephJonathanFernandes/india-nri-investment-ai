import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { answerQuestion } from '../services/aiAssistant';
import { validate, apiError } from '../middleware/validation';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').trim(),
  conversationId: z.string().optional(),
});

/** POST /api/assistant/chat */
router.post('/chat', optionalAuth, validate(chatSchema), async (req: AuthRequest, res) => {
  const { message, conversationId } = req.body as z.infer<typeof chatSchema>;

  let convId = conversationId;
  if (req.user) {
    if (!convId) {
      const conv = await db.createChatConversation({
        userId: req.user.userId,
        title: message.slice(0, 60),
      });
      convId = conv.id;
    } else {
      const existing = await db.findChatConversationById(convId);
      if (!existing || (existing.userId && existing.userId !== req.user!.userId)) {
        apiError(res, 404, 'not_found', 'Conversation not found.');
        return;
      }
    }
  }

  const profile = req.user ? await db.findUserProfileByUserId(req.user.userId) : undefined;

  let answer: string;
  let sources: string[];
  try {
    const result = await answerQuestion(message, profile, convId);
    answer = result.answer;
    sources = result.sources;
  } catch (err) {
    console.error('[assistant] error:', err);
    answer =
      'I could not generate a response at this time. Please try again later or consult a qualified professional.';
    sources = [];
  }

  if (convId) {
    await db.createChatMessage({ conversationId: convId, role: 'USER', content: message });
    await db.createChatMessage({
      conversationId: convId,
      role: 'ASSISTANT',
      content: answer,
      sources,
    });
    if (req.user) {
      await db.updateChatConversation(convId, { title: message.slice(0, 60) });
    }
  }

  res.json({ conversationId: convId, answer, sources });
});

/** GET /api/assistant/conversations */
router.get('/conversations', requireAuth, async (req: AuthRequest, res) => {
  const conversations = await db.listChatConversations(req.user!.userId);
  res.json({ conversations });
});

/** GET /api/assistant/conversations/:id/messages */
router.get('/conversations/:id/messages', requireAuth, async (req: AuthRequest, res) => {
  const conv = await db.findChatConversationById(req.params.id);
  if (!conv) {
    apiError(res, 404, 'not_found', 'Conversation not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && conv.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own conversations.');
    return;
  }
  const messages = await db.listChatMessages(req.params.id);
  res.json({ messages });
});

export default router;
