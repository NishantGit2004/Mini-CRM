import BotIcon from "../icons/BotIcon";

export default function Header({ user, onLogout, onNavigate }) {
  return (
    <header className="bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onNavigate("dashboard")}
        >
          <BotIcon className="w-8 h-8 text-teal-400" />
          <span className="text-xl font-bold">Xeno CRM</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
          <img
            src={user.imageUrl}
            alt={user.name}
            className="w-10 h-10 rounded-full"
          />
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}