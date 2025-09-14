  import Breadcrumb from "../components/Breadcrumb";
  import SparklesIcon from "../icons/SparklesIcon";
  import PlusIcon from "../icons/PlusIcon";
  import ChevronRightIcon from "../icons/ChevronRightIcon";
  import TrashIcon from '../icons/TrashIcon'

  const SegmentBuilderPage = ({ newSegment, setNewSegment, aiPrompt, setAiPrompt, onGenerateRules, onPreview, onSave, audienceCount, isLoading, onUpdateRule, onAddRule, onRemoveRule, onNavigate }) => {
      
      const fields = ['total_spend', 'visits', 'last_order_at', 'tags'];
      const operators = {
          total_spend: ['>', '<', '='],
          visits: ['>', '<', '='],
          last_order_at: ['older_than_days', 'newer_than_days'],
          tags: ['contains', 'not_contains']
      };

      return (
          <div className="max-w-4xl mx-auto px-4 py-8">
              <button onClick={() => onNavigate('dashboard')} className="text-slate-400 hover:text-white mb-4">&larr; Back to Dashboard</button>
              <Breadcrumb steps={[{name: 'Create Segment'}, {name: 'Create Campaign'}, {name: 'Launch'}]} currentStep={1} />
              <h1 className="text-3xl font-bold mb-2">Create Audience Segment</h1>
              <p className="text-slate-400 mb-8">Define rules to segment your customers. Start with AI or build manually.</p>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
                  <label htmlFor="ai-prompt" className="flex items-center space-x-2 text-lg font-semibold mb-3 text-teal-400">
                      <SparklesIcon />
                      <span>✨ Generate with AI</span>
                  </label>
                  <p className="text-sm text-slate-400 mb-4">Describe the audience you want to target in plain language.</p>
                  <div className="flex items-center gap-4">
                      <input id="ai-prompt" type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., Customers who spent over 10k and haven't visited in 3 months" className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-teal-500 focus:outline-none transition" />
                      <button onClick={onGenerateRules} disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 font-bold py-3 px-5 rounded-lg flex items-center space-x-2 transition-colors disabled:bg-slate-600">
                        <span>Generate</span>
                      </button>
                  </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                  <h2 className="text-lg font-semibold mb-4">Segment Rules</h2>
                  <input type="text" value={newSegment.name} onChange={(e) => setNewSegment({...newSegment, name: e.target.value})} placeholder="Enter segment name (e.g., High Value Customers)" className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 mb-6 focus:ring-2 focus:ring-teal-500 focus:outline-none transition" />

                  {newSegment?.rules?.length > 0 && (
                      <div className="flex items-center mb-4">
                          <span className="mr-4 text-slate-400">Match</span>
                          <select value={newSegment.combinator} onChange={(e) => setNewSegment({ ...newSegment, combinator: e.target.value })} className="bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-teal-500 focus:outline-none">
                              <option>AND</option>
                              <option>OR</option>
                          </select>
                          <span className="ml-4 text-slate-400">of the following rules:</span>
                      </div>
                  )}

                  <div className="space-y-4 mb-6">
                      {newSegment?.rules?.map((rule) => (
                          <div key={rule.id} className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                            <select value={rule.field} onChange={(e) => onUpdateRule(rule.id, 'field', e.target.value)} className="bg-slate-700 border-slate-600 rounded-md p-2">
                                {fields.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                            </select>
                            <select value={rule.operator} onChange={(e) => onUpdateRule(rule.id, 'operator', e.target.value)} className="bg-slate-700 border-slate-600 rounded-md p-2">
                                {(operators[rule.field] || []).map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                            </select>
                            <input type="text" value={rule.value} onChange={(e) => onUpdateRule(rule.id, 'value', e.target.value)} placeholder="Value" className="w-full bg-slate-600 border-slate-500 rounded-md p-2" />
                            <button onClick={() => onRemoveRule(rule.id)} className="p-2 text-slate-400 hover:text-red-400"> <TrashIcon className="w-5 h-5" /> </button>
                          </div>
                      ))}
                  </div>
                  <button onClick={onAddRule} className="text-teal-400 font-semibold flex items-center space-x-1 hover:text-teal-300">
                      <PlusIcon className="w-5 h-5"/>
                      <span>Add Rule</span>
                  </button>
              </div>

              <div className="mt-8 flex justify-end items-center gap-4">
                  {audienceCount !== null && (
                      <div className="text-center">
                          <p className="text-slate-400 text-sm">Estimated Audience</p>
                          <p className="text-2xl font-bold text-teal-400 font-mono">{audienceCount.toLocaleString()}</p>
                      </div>
                  )}
                  <button onClick={onPreview} disabled={isLoading || newSegment?.rules?.length === 0} className="bg-slate-700 hover:bg-slate-600 font-bold py-3 px-5 rounded-lg transition-colors disabled:opacity-50">
                      Preview Audience
                  </button>
                  <button onClick={onSave} disabled={isLoading || audienceCount === null} className="bg-teal-500 hover:bg-teal-600 font-bold py-3 px-5 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50">
                      <span>Save & Continue</span>
                      <ChevronRightIcon className="w-5 h-5" />
                  </button>
              </div>
          </div>
      );
  };

  export default SegmentBuilderPage