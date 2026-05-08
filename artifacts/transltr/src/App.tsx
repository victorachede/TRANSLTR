import { Switch, Route, Router as WouterRouter } from "wouter";
import Nav from "./components/Nav";
import LandingPage from "./views/LandingPage";
import TranslatorPage from "./views/TranslatorPage";
import DashboardPage from "./views/DashboardPage";
import ProjectorPage from "./views/ProjectorPage";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>404</h1>
        <p style={{ color: "var(--text-secondary)" }}>Page not found</p>
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <>
      <Nav />
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/translator" component={TranslatorPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/projector" component={ProjectorPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AppLayout />
    </WouterRouter>
  );
}

export default App;
