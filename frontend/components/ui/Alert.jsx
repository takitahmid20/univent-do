// components/ui/Alert.jsx
const Alert = ({ children, className = "" }) => {
    return (
      <div className={`bg-green-50 text-green-800 rounded-lg p-4 ${className}`}>
        {children}
      </div>
    );
  };
  
  const AlertDescription = ({ children }) => {
    return <div className="text-sm">{children}</div>;
  };
  
  export default { Alert, AlertDescription };