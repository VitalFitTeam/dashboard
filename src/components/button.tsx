import { colors } from "@/styles/styles";

const buttonStyle = {
  backgroundColor: colors.primary,
  color: colors.complementary.white,
};

const Button = () => {
  return (
    <button
      style={buttonStyle}
      className="w-[252px] h-[46px] px-4 py-2 rounded-[8px] font-medium focus:outline-none border-none"
    >
      Botón Naranja
    </button>
  );
};

export default Button;