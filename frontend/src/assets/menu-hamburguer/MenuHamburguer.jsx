function MenuHamburguer({ setIsOpen, isOpen }) {
  const openMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      onClick={openMenu}
      className={`fixed top-4 left-4 z-50 w-11 h-11 flex-col justify-center items-center gap-1.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors ${
        isOpen ? "hidden" : "flex"
      }`}
      id="hamburgerBtn"
    >
      <span className="block w-6 h-0.5 bg-gray-800 rounded"></span>
      <span className="block w-6 h-0.5 bg-gray-800 rounded"></span>
      <span className="block w-6 h-0.5 bg-gray-800 rounded"></span>
    </button>
  );
}

export default MenuHamburguer;