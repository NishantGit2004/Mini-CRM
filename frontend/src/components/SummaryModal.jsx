import XIcon from '../icons/XIcon'

const SummaryModal = ({ modalState, setModalState }) => {
    if (!modalState.isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalState({ ...modalState, isOpen: false })}>
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-teal-400">✨ AI Performance Summary</h2>
                    <button onClick={() => setModalState({ ...modalState, isOpen: false })} className="text-slate-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="mb-4">
                    <h3 className="font-semibold text-slate-100">{modalState.campaign.name}</h3>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg text-slate-300">
                    {modalState.isLoading ? (
                        <div className="flex items-center space-x-2">
                           <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                           <span>Gemini is analyzing the results...</span>
                        </div>
                    ) : (
                        <p style={{whiteSpace: "pre-wrap"}}>{modalState.summary}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryModal;