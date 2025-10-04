import { colors } from "@/styles/styles";

type InputProps = {
  label: string;
  value?: string;
  type?: string;
  helperText?: string;
  placeholder?: string;
};

const Input = ({
  label,
  type = "text",
  value,
  helperText,
  placeholder,
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1 ">
      {/* Label */}
      <label
        className="text-sm font-medium"
        style={{ color: colors.complementary.black }}
      >
        {label}
      </label>

      {/* Input */}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        className="px-3 py-2 border rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-primary"
        style={{
          borderColor: colors.complementary.darkGray,
        }}
      />

      {/* Helper Text */}
      {helperText && (
        <span
          className="text-xs"
          style={{ color: colors.complementary.darkGray }}
        >
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;
