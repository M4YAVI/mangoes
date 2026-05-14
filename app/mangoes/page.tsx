import TopBar from "../components/TopBar";
import Header from "../components/Header";
import MangoGrid from "../components/MangoGrid";
import Footer from "../components/Footer";

export default function MangoesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Header />
      <div className="pt-4">
        <MangoGrid />
      </div>
      <Footer />
    </div>
  );
}
