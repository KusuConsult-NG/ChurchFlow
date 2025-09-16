import { NavLink } from 'react-router-dom';
export default function AccountsMenu(){
  return (
    <div className="flex gap-2">
      <NavLink to="/accounts/new" className="px-3 py-2 border rounded">New</NavLink>
      <NavLink to="/accounts/history" className="px-3 py-2 border rounded">View History</NavLink>
      <NavLink to="/accounts/statements" className="px-3 py-2 border rounded">Generate Statements</NavLink>
    </div>
  );
}
