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
    <div className="flex flex-col gap-1">
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
        className={`
          px-3 py-2 rounded-md font-sans border
          bg-gray-50 text-gray-900
          border-gray-300
          focus:outline-none focus:ring-2 focus:ring-[${colors.primary}] focus:border-transparent
          transition-all duration-200
          placeholder:text-gray-400
        `}
      />

      {/* Helper Text */}
      {helperText && (
        <span className="text-xs" style={{ color: colors.complementary.darkGray }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

export default Input;