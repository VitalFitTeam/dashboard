export default function LoginFields() {
  return (
    <div className="flex h-[42px] w-full lg:w-[742px]items-center bg-gray-100 rounded-md p-[5px] gap-0">
      {/* Campo Account */}
      <input
        type="text"
        placeholder="Account"
        className="flex-1 h-full px-2 text-sm text-gray-800 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Campo Password */}
      <input
        type="password"
        placeholder="Password"
        className="flex-1 h-full px-2 text-sm text-gray-800 placeholder-gray-400 border border-gray-300 rounded-md ml-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
