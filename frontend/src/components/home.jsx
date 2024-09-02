import React from 'react';
import ComparisonTable from './check';
import Footer from './footer';


const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center px-10 py-5">
      <div className="font-bold text-xl">Landing</div>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-gray-300">Feature</a>
          <a href="#" className="hover:text-gray-300">About</a>
          <a href="#" className="hover:text-gray-300">Contact</a>
          <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          SignIn/SignUp
        </button>
        </div>
        
        
      </nav>

      {/* Main Content */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-center lg:space-x-10 px-10 lg:px-20 py-10">
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Split it <br/> Its easy this way.</h1>
          <p className="text-gray-400 mb-8">
            Why use Splitwise if we can do the same job but for free.
          </p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <button className="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700">Login</button>
            <button className="bg-transparent border border-white py-3 px-6 rounded hover:bg-white hover:text-gray-900">Learn More</button>
          </div>
        </div>
        <div className="md:w-1/2 mb-10 lg:mb-0">
          <img src="div.png" alt="Illustration" className="w-full h-auto"/>
        </div>
      </div>
      <ComparisonTable/>
      <section className="bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center text-center mb-24">
            <div className="w-full lg:w-6/12 px-4">
              <h2 className="text-4xl font-semibold text-white">What Our Users Say</h2>
              <p className="text-lg leading-relaxed m-4 text-gray-400">
                Hear from our satisfied users
              </p>
            </div>
          </div>
          <div className="flex flex-wrap">
            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-700 w-full mb-8 shadow-lg rounded-lg p-6">
                <div className="px-4 py-5 flex-auto">
                  <p className="mt-2 mb-4 text-gray-400">
                    "Knowledge is power, and CodeShrine is a treasure trove. Imagine having all your coding profiles in one place and tracking upcoming contests effortlessly. It's like having a map to navigate the coding world. CodeShrine is my indispensable companion, helping me achieve my goals and share my journey with others."
                  </p>
                  <h6 className="text-xl font-semibold text-white">- Nico Robin</h6>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-700 w-full mb-8 shadow-lg rounded-lg p-6">
                <div className="px-4 py-5 flex-auto">
                  <p className="mt-2 mb-4 text-gray-400">
                    "With CodeShrine, I can see all my coding profiles in one place and never miss a contest. It's like seeing infinity in a single glance! The reminders are a lifesaver, and sharing my profile with friends and rivals has never been easier. CodeShrine keeps me sharp and ready for the next big challenge."
                  </p>
                  <h6 className="text-xl font-semibold text-white">- Satoru Gojo</h6>
                </div>
              </div>
            </div>

            <div className="w-full md:w-4/12 px-4 text-center">
              <div className="relative flex flex-col min-w-0 break-words bg-gray-700 w-full mb-8 shadow-lg rounded-lg p-6">
                <div className="px-4 py-5 flex-auto">
                  <p className="mt-2 mb-4 text-gray-400">
                    "Believe it! CodeShrine is my secret weapon to track upcoming contests and share my coding journey with friends. Dattebayo! Whether it's seeing all my profiles in one place or getting crucial reminders, CodeShrine keeps me pumped and ready for every challenge. It's a must-have for every coding ninja!"
                  </p>
                  <h6 className="text-xl font-semibold text-white">- Naruto Uzumaki</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default LandingPage;
