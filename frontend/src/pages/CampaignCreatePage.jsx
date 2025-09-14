import Breadcrumb from "../components/Breadcrumb";
import SparklesIcon from "../icons/SparklesIcon";
import SendIcon from '../icons/SendIcon'

const CampaignCreatePage = ({ newCampaign, setNewCampaign, onAiSuggest, onLaunch, isLoading, onNavigate }) => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button onClick={() => onNavigate('createSegment')} className="text-slate-400 hover:text-white mb-4">&larr; Back to Segment</button>
            <Breadcrumb steps={[{name: 'Create Segment'}, {name: 'Create Campaign'}, {name: 'Launch'}]} currentStep={2} />
            <h1 className="text-3xl font-bold mb-2">Create Campaign Message</h1>
            <p className="text-slate-400 mb-8">Compose your message. Use placeholders like {'`{{name}}`'} for personalization.</p>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8">
                <h2 className="text-lg font-semibold">Audience: <span className="text-teal-400">{newCampaign.segment.name}</span></h2>
                <p className="text-sm text-slate-400">Estimated recipients: {newCampaign.segment.preview_count.toLocaleString()}</p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <label htmlFor="message" className="block text-lg font-semibold mb-3"> Message Content </label>
                 <textarea id="message" rows="6" value={newCampaign.message} onChange={(e) => setNewCampaign({ ...newCampaign, message: e.target.value })} placeholder="e.g., Hi {{name}}, here’s 10% off on your next order!" className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 focus:ring-2 focus:ring-teal-500 focus:outline-none transition mb-4" />
                <button onClick={onAiSuggest} disabled={isLoading} className="bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50">
                    <SparklesIcon className="w-5 h-5 text-teal-400"/>
                    <span>✨ Suggest with AI</span>
                </button>
            </div>

             <div className="mt-8 flex justify-end">
                 <button onClick={onLaunch} disabled={isLoading || !newCampaign.message} className="bg-green-600 hover:bg-green-700 font-bold py-3 px-6 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:bg-slate-600">
                    <SendIcon className="w-5 h-5"/>
                    <span>Launch Campaign</span>
                </button>
            </div>
        </div>
    );
};

export default CampaignCreatePage;