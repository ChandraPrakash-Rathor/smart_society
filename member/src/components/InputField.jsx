function InputField({ label, type = 'text', value, onChange, placeholder, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-brand-900">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition
            focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-brand-300
            ${error
              ? 'border-red-400 bg-red-50'
              : 'border-brand-200 bg-brand-50 hover:border-brand-300 text-brand-900'
            }`}
        />
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

export default InputField
