import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const About = () => {
  return (
    <div className="min-h-screen bg-orange-50">
   
      
      
      <section className="py-16 px-6 bg-gradient-to-br from-[#7f1d1d] via-[#b91c1c] to-[#f97316] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-yellow-400 text-xl mb-4 font-semibold">हाम्रो कथा</div>
          <h1 className="text-5xl font-bold mb-8">About Newa Chhen</h1>
          <p className="text-xl text-orange-200 leading-relaxed">
            Where 2000 years of Newari tradition meets your table
          </p>
        </div>
      </section>

     
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-red-800 mb-8">Our Heritage</h2>
              <p className="text-lg text-red-700 mb-6 leading-relaxed">
                Born from the ancient kitchens of Patan, Newa Chhen preserves the authentic 
                flavors of Nepal's Kathmandu Valley. Our recipes haven't changed in centuries - 
                they've been passed down through generations of Newari families who understood 
                that food is more than sustenance.
              </p>
              <p className="text-lg text-red-600 mb-8 leading-relaxed">
                Every dish we serve carries the weight of history and the warmth of tradition. 
                From our sacred Samay Baji to the delicate Yomari, each meal is a celebration 
                of our rich cultural heritage.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-white p-4 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-red-600">2000+</div>
                  <div className="text-red-700">Years of Tradition</div>
                </div>
                <div className="text-center bg-white p-4 rounded-lg shadow-md">
                  <div className="text-3xl font-bold text-orange-600">3</div>
                  <div className="text-red-700">Master Chefs</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://assets.simplotel.com/simplotel/image/upload/w_5000,h_3333/x_0,y_0,w_5000,h_2812,r_0,c_crop/q_80,w_900,dpr_1,f_auto,fl_progressive,c_limit/the-nanee-bhaktapur-nepal/Traditional_newari_Platter__11034f62"
                alt="Traditional Newari cooking"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-yellow-500 text-red-800 p-6 rounded-xl shadow-lg">
                <div className="font-bold">Authentic</div>
                <div className="text-sm">Newari Recipes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-6 bg-red-800">
        <div className="max-w-6xl mx-auto text-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What Makes Us Special</h2>
            <div className="text-yellow-400 text-lg">के हामीलाई विशेष बनाउँछ</div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <img  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC_bxO5298RlvzKa82YNjE6KzVbXlJ6Y6mwA&s" className="w-40 h-40 bg-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                
              </img>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Ancient Recipes</h3>
              <p className="text-orange-200 leading-relaxed">
                Original recipes unchanged for centuries, prepared exactly as our ancestors did
              </p>
            </div>
            
            <div className="text-center">
               <img  src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=500&fit=crop" className="w-40 h-40 bg-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                
              </img>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Sacred Ingredients</h3>
              <p className="text-orange-200 leading-relaxed">
                Sourced from local farms in the Kathmandu Valley, blessed by tradition
              </p>
            </div>
            
            <div className="text-center">
               <img  src="https://cdn.roadsandkingdoms.com/uploads/2018/07/RNK24.jpg?class=1536" 
               className="w-40 h-40 bg-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                
              </img>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Cultural Experience</h3>
              <p className="text-orange-200 leading-relaxed">
                Not just a meal, but a journey through Nepal's rich cultural heritage
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-6 bg-gradient-to-r from-orange-400 to-yellow-400">
        <div className="max-w-4xl mx-auto text-center text-red-800">
          <h2 className="text-4xl font-bold mb-8">Our Promise</h2>
          <p className="text-xl mb-8 leading-relaxed">
            Every meal at Newa Baji is prepared with the same love, respect, and 
            dedication that our ancestors brought to their kitchens. We promise to 
            keep these sacred traditions alive, one plate at a time.
          </p>
          
          <div className="bg-white p-8 rounded-xl shadow-lg inline-block">
            <p className="text-2xl font-bold text-red-700 mb-2">
              "भोजन हाम्रो संस्कृति हो"
            </p>
            <p className="text-lg text-red-600">
              Food is our culture - and we share it with pride
            </p>
          </div>
        </div>
      </section>

        
    </div>
  );
};

export default About;