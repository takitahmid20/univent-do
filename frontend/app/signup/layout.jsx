// src/app/signup/layout.jsx
const SignUpLayout = ({ children }) => {
    return (
      <div 
      // className="flex h-screen"
      >
        {/* <div className="flex-1 bg-gray-800 text-white flex flex-col justify-center items-center p-8">
          <h1 className="text-4xl font-bold mb-4">Discover tailored events.</h1>
          <p className="text-lg">Sign up for personalized recommendations today!</p>
        </div> */}
  
        {/* Right Side */}
        {/* <div className="flex-1 flex justify-center items-center bg-white p-8 width-100"> */}
          {/* <div className="w-full max-w-lg bg-white rounded-lg p-6"> */}
            {children}
          {/* </div> */}
        {/* </div> */}
      </div>
    );
  };
  
  export default SignUpLayout;
  