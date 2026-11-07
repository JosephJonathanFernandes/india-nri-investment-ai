import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, FileText, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function Checklist() {
  const { user, profile } = useAuth();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadChecklists();
  }, [user]);

  const loadChecklists = async () => {
    try {
      const res: any = await api.get('/checklists');
      const lists = res.checklists || [];
      setChecklists(lists);
      if (!activeId && lists.length > 0) setActiveId(lists[0].id);
    } catch {}
  };

  const createList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const res: any = await api.post('/checklists', {
        title: newTitle.trim(),
        category: 'NRI Investment',
      });
      setChecklists([...checklists, res.checklist]);
      setNewTitle('');
      setActiveId(res.checklist.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create checklist.');
    } finally {
      setLoading(false);
    }
  };

  const activeList = checklists.find((c) => c.id === activeId);
  const items = activeList?.items || [];

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim() || !activeId) return;
    try {
      const res: any = await api.post(`/checklists/${activeId}/items`, {
        title: newItem.trim(),
        isConditional: true,
        order: items.length,
      });
      setActiveId(activeId); // refresh
      await loadChecklists();
      setNewItem('');
    } catch (err: any) {
      setError(err.message || 'Failed to add item.');
    }
  };

  const toggleItem = async (item: any) => {
    try {
      await api.put(`/checklists/${activeId}/items/${item.id}`, { isCompleted: !item.isCompleted });
      await loadChecklists();
    } catch (err: any) {
      setError(err.message || 'Failed to update item.');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Remove this checklist item?')) return;
    try {
      await api.del(`/checklists/${activeId}/items/${id}`);
      await loadChecklists();
    } catch {}
  };

  const deleteList = async (id: string) => {
    if (!confirm('Delete this checklist?')) return;
    try {
      await api.del(`/checklists/${id}`);
      await loadChecklists();
      if (activeId === id) setActiveId(checklists.find((c) => c.id !== id)?.id || null);
    } catch {}
  };

  const completion = items.length
    ? Math.round((items.filter((i: any) => i.isCompleted).length / items.length) * 100)
    : 0;

  const defaultItems = [
    {
      title: 'PAN card',
      desc: 'Permanent Account Number required for most Indian investments.',
      required: true,
    },
    {
      title: 'Passport & overseas address proof',
      desc: 'Valid passport and proof of address in your country of residence.',
      required: true,
    },
    {
      title: 'KYC registration',
      desc: 'SEBI-registered intermediary KYC (KRA) verification.',
      required: true,
    },
    {
      title: 'NRE / NRO bank account',
      desc: 'Repatriable (NRE) or non-repatriable (NRO) account for funds.',
      required: false,
      conditional: true,
    },
    {
      title: 'NRI-compatible brokerage & demat',
      desc: 'Broker that accepts NRI clients and offers demat account.',
      required: false,
      conditional: true,
    },
    {
      title: 'FATCA / CRS declaration',
      desc: 'Tax residency declaration where applicable (e.g. US persons).',
      required: false,
      conditional: true,
    },
    {
      title: 'Bank / broker-specific forms',
      desc: 'Account opening forms, PIS letter (equity, where applicable).',
      required: false,
      conditional: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
              Account & Document Checklist
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Conditional checklist of documents and steps for different NRI investment routes. Mark
              items complete and save progress.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => setActiveId(null)}>
              New checklist
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: existing checklists */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Your checklists</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <form onSubmit={createList} className="space-y-2 mb-4">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Checklist name"
                    className="text-sm"
                  />
                  <Button
                    type="submit"
                    variant="emerald"
                    size="sm"
                    className="w-full"
                    disabled={loading || !newTitle.trim()}
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </Button>
                </form>
                <div className="space-y-2">
                  {checklists.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      No checklists yet.
                    </p>
                  )}
                  {checklists.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveId(c.id);
                        setError(null);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors',
                        activeId === c.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-navy-900 dark:text-white'
                          : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10'
                      )}
                    >
                      <FileText className="w-4 h-4 mr-2 text-gray-400" /> {c.title}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteList(c.id);
                        }}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-red-500"
                        aria-label="Delete"
                      >
                        <AlertTriangle className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main: checklist items */}
          <div className="lg:col-span-3">
            {!activeId || !activeList ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3 text-gray-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-navy-900 dark:text-white mb-2">
                  Select or create a checklist
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Checklists show conditional documents based on your investment route.
                </p>
              </div>
            ) : (
              <Card>
                <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{activeList.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {items.length} items · {completion}% complete
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={completion === 100 ? 'eligible' : 'insufficient'}>
                      {completion}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                    {items.length === 0 && (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No items yet. Add your first item below.
                      </div>
                    )}
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                      {items.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-4 flex items-start gap-3 group hover:bg-gray-50 dark:hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => toggleItem(item)}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:bg-navy-800 dark:border-white/20"
                          />
                          <div className="flex-1">
                            <div
                              className={`flex items-center gap-2 text-sm ${item.isCompleted ? 'text-gray-400 line-through' : 'text-navy-900 dark:text-white'}`}
                            >
                              {item.title}
                              {item.isConditional && (
                                <Badge variant="insufficient" className="text-[10px] ml-1">
                                  Conditional
                                </Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                            aria-label="Delete item"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form
                    onSubmit={addItem}
                    className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex gap-2"
                  >
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Add a checklist item…"
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="submit"
                      variant="emerald"
                      size="sm"
                      disabled={!newItem.trim() || !activeId}
                    >
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Items marked "Conditional" are not universally mandatory — they apply to
                    specific investment routes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <p className="text-center mt-10 text-xs text-gray-500 dark:text-gray-500">
          Educational guidance only — document requirements vary by bank, broker, and country.
          Confirm with your chosen intermediary.
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
