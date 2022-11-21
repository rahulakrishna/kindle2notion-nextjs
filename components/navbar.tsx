import { SyntheticEvent, useState } from "react";
import { Menu, MenuItemProps } from "semantic-ui-react";

const Navbar = () => {
  const [activeItem, setActiveItem] = useState("home");
  const handleItemClick = (e: SyntheticEvent, { name }: MenuItemProps) =>
    setActiveItem(name || "home");
  return (
    <Menu inverted>
      <Menu.Item
        name="kindle2notion"
        active={activeItem === "home"}
        onClick={handleItemClick}
      />
    </Menu>
  );
};

export default Navbar;
