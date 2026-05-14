import TopBar from "./components/TopBar";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import MangoGrid from "./components/MangoGrid";

import WhyUs from "./components/WhyUs";
import CustomerReviews from "./components/CustomerReviews";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen scroll-smooth">
      <TopBar />
      <Header />
      <HeroSection />
      <MangoGrid limit={6} />

      <WhyUs />
      <CustomerReviews />
      <Footer />
    </div>
  );
}
