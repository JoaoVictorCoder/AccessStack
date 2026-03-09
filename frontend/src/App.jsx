import { useEffect, useState } from "react";
import {
	Navigate,
	NavLink,
	Route,
	Routes,
	useNavigate,
} from "react-router-dom";
import { logout, me } from "./api/credenciamentoApi";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminCredencialPage from "./pages/AdminCredencialPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import OperatorAreaPage from "./pages/OperatorAreaPage";
import OperatorLoginPage from "./pages/OperatorLoginPage";
import PublicAreaPage from "./pages/PublicAreaPage";

function getTabClassName({ isActive }) {
	return isActive ? "tab active" : "tab";
}

function TabLink({ to, children, end = false }) {
	return (
		<NavLink to={to} end={end} className={getTabClassName}>
			{children}
		</NavLink>
	);
}

function AppHeader({ admin, operator, isOperatorSession }) {
	return (
		<header className="topbar">
			<div className="brand-block">
				<h1>Alta Cafe</h1>
				<p>Sistema oficial de credenciamento e acesso</p>
			</div>
			<nav className="tabs">
				<TabLink to="/" end>
					Publico
				</TabLink>
				{!isOperatorSession && (
					<TabLink to={admin ? "/admin" : "/admin/login"}>Admin</TabLink>
				)}
				<TabLink to={operator ? "/operator" : "/operator/login"}>
					Operador QR
				</TabLink>
			</nav>
		</header>
	);
}

function normalizeSession(response) {
	const role = response.admin?.role;

	if (role === "OPERADOR_QR") {
		return { admin: null, operator: response.admin };
	}

	return { admin: response.admin, operator: null };
}

export default function App() {
	const navigate = useNavigate();
	const [admin, setAdmin] = useState(null);
	const [operator, setOperator] = useState(null);
	const [checkingAuth, setCheckingAuth] = useState(true);
	const isOperatorSession = Boolean(operator) && !admin;

	useEffect(() => {
		me()
			.then((response) => {
				const session = normalizeSession(response);
				setAdmin(session.admin);
				setOperator(session.operator);
			})
			.catch(() => {
				setAdmin(null);
				setOperator(null);
			})
			.finally(() => setCheckingAuth(false));
	}, []);

	async function handleLogout() {
		await logout();
		setAdmin(null);
		setOperator(null);
		navigate("/admin/login");
	}

	if (checkingAuth) {
		return <p className="loading-screen">Carregando...</p>;
	}

	return (
		<div className="app-shell">
			<AppHeader
				admin={admin}
				operator={operator}
				isOperatorSession={isOperatorSession}
			/>

			<Routes>
				<Route path="/" element={<PublicAreaPage />} />
				<Route
					path="/admin/login"
					element={<AdminLoginPage onLoggedIn={setAdmin} />}
				/>
				<Route
					path="/operator/login"
					element={<OperatorLoginPage onLoggedIn={setOperator} />}
				/>
				<Route
					path="/admin"
					element={
						<ProtectedAdminRoute admin={admin}>
							<AdminDashboardPage admin={admin} onLogout={handleLogout} />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path="/operator"
					element={
						<ProtectedAdminRoute admin={operator}>
							<OperatorAreaPage operator={operator} />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path="/admin/credenciais/:id"
					element={
						<ProtectedAdminRoute admin={admin}>
							<AdminCredencialPage />
						</ProtectedAdminRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}
