import { colors } from "@/styles/styles";

const buttonStyle = {
  backgroundColor: colors.primary,
  color: colors.complementary.white,
};

const Button = () => {
  return <button style={buttonStyle}>Botón Naranja</button>;
};

export default Button;
