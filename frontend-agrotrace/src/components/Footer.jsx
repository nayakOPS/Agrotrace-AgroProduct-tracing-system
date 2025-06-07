function Footer() {
    return (
      <footer className="bg-green-600 text-white text-center p-4 mt-8">
        {/* <p>&copy; 2025 AgroChain. All rights reserved.</p> */}
        <p>&copy; {new Date().getFullYear()} AgroTrace. All rights reserved.</p>
      </footer>
    );
  }
  
  export default Footer;
  