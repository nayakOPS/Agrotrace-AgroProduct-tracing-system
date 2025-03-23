// import Navbar from "../components/NavBar";
import  AboutUs  from "./AboutUs";
import ContactUs from "./ContactUs";

function Home() {
  return (
    <div className="bg-green-50 min-h-screen">
      {/* <Navbar /> */}
      <div className="p-4">
        <AboutUs />
        <ContactUs />
      </div>
    </div>
  );
}

export default Home;