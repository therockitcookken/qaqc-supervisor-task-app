import Link from "next/link";
export const Card = ({ children }: { children: React.ReactNode }) => <div className="rounded border p-4 bg-white">{children}</div>;
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input className="border rounded px-3 py-2 w-full" {...props} />;
export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50" {...props}>{children}</button>;
export const Nav = () => <nav className="p-4 border-b flex gap-4"><Link href="/">Home</Link><Link href="/dashboard">Dashboard</Link><Link href="/learn">Learn</Link><Link href="/vocab">Vocab</Link><Link href="/srs">SRS</Link><Link href="/classrooms">Classrooms</Link><Link href="/admin">Admin</Link><Link href="/login">Login</Link></nav>;
