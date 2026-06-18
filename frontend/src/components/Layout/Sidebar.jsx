import { CATEGORIES, FOLDERS } from '../../utils/constants';
import { InboxIcon, ArchiveIcon, SpamIcon } from '../UI/Icons';

const folderIcons = { inbox: InboxIcon, archive: ArchiveIcon, spam: SpamIcon };

export default function Sidebar({ folder, onFolderChange, category, onCategoryChange, unreadCount }) {
  return (
    <nav className="sidebar">
      {FOLDERS.map(f => {
        const Icon = folderIcons[f.key];
        return (
        <button
          key={f.key}
          className={`sidebar-item ${folder === f.key ? 'active' : ''}`}
          onClick={() => onFolderChange(f.key)}
        >
          <Icon />
          <span>{f.label}</span>
          {f.key === 'inbox' && unreadCount > 0 && (
            <span className="badge">{unreadCount}</span>
          )}
        </button>
        );
      })}

      <div className="sidebar-section">Categories</div>
      {CATEGORIES.map(c => (
        <button
          key={c.key}
          className={`sidebar-category ${category === c.key ? 'active' : ''}`}
          onClick={() => onCategoryChange(c.key === category ? null : c.key)}
        >
          <span className="category-dot" style={{ background: c.color }} />
          <span>{c.label}</span>
        </button>
      ))}
    </nav>
  );
}
