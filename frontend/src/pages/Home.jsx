import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&h=600&fit=crop',
    'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/09/4e/09/66.jpg',
    'https://i0.wp.com/s3.tipsnepal.com/2021/06/cs19.jpg?fit=640%2C427&quality=95&strip=all&ssl=1'
    
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    
      <div>
       

      
      <section id="home" className="relative h-[75vh] overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Newari Food ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-orange-900/60"></div>
        
       
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fbbf24' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="max-w-5xl px-6 text-center">
            <div className="text-yellow-400 text-2xl md:text-3xl mb-4 font-bold">
              स्वागतम् • Welcome • नमस्ते
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Authentic <span className="text-yellow-400">Newari</span> Cuisine
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-200 max-w-3xl mx-auto leading-relaxed">
              Experience the rich culinary heritage of Nepal with traditional Newari dishes 
              prepared using ancient recipes passed down through generations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to='/menu' className="bg-yellow-500 text-red-800 px-10 py-4 rounded-full text-lg font-bold hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 shadow-lg">
                Explore Menu
              </Link>
              <Link to="/menu" className="border-2 border-yellow-400 text-yellow-400 px-10 py-4 rounded-full text-lg font-bold hover:bg-yellow-400 hover:text-red-800 transition-all duration-300">
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-6 bg-gradient-to-b from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-red-600 text-xl mb-4 font-semibold">नेवारी व्यञ्जन</div>
            <h2 className="text-5xl font-bold text-red-800 mb-6">Traditional Newari Delicacies</h2>
            <p className="text-xl text-red-700 max-w-4xl mx-auto">
              Discover the authentic flavors of Kathmandu Valley with our carefully curated selection of traditional Newari dishes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-4 bg-gradient-to-r from-red-600 to-yellow-500"></div>
              <div className="p-8 text-center">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlyRr48D6oEf39Nr7lQbprYV8ikbcR-0ZS_w&s"className="w-40 h-40 bg-gradient-to-br from-red-600 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  
                </img>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Samay Baji</h3>
                <p className="text-red-700 text-lg leading-relaxed">
                  The quintessential Newari platter featuring beaten rice, grilled meat, boiled egg, 
                  and traditional pickles - a complete ceremonial feast
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-4 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
              <div className="p-8 text-center">
                <img src='https://static1.squarespace.com/static/53ecd1bde4b0a6f9524254f8/t/675bdd6f2fda443f1ac0726e/1734073711928/Yomari-Punhi-Nepal-Festivals-shankerhotel_com_np.png?format=1500w'
                 className="w-40 h-40 bg-gradient-to-br from-red-600 to-orange-500 rounded-full mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  
                </img>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Yomari</h3>
                <p className="text-red-700 text-lg leading-relaxed">
                  Sacred steamed dumplings shaped like fish, filled with sweet molasses and sesame - 
                  a symbol of prosperity and good fortune
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-orange-200 hover:shadow-xl transition-all duration-300 group">
              <div className="h-4 bg-gradient-to-r from-yellow-500 to-red-600"></div>
              <div className="p-8 text-center">
                <img src="https://sanascarte.com/wp-content/uploads/2022/04/DSC_0117-1536x1024.jpg" className="w-40 h-40 bg-gradient-to-br from-yellow-500 to-red-600 rounded-full mx-auto mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                  
                </img>
                <h3 className="text-2xl font-bold text-red-800 mb-4">Wo (Bara)</h3>
                <p className="text-red-700 text-lg leading-relaxed">
                  Traditional lentil pancakes, crispy on the outside and soft inside, 
                  often topped with egg and served during festivals and celebrations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    
      <section className="py-20 px-6 bg-red-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="text-orange-100">
              <div className="text-yellow-400 text-xl mb-4 font-semibold">सांस्कृतिक धरोहर</div>
              <h2 className="text-5xl font-bold mb-8 text-white">
                Heritage of the <span className="text-yellow-400">Kathmandu Valley</span>
              </h2>
              <p className="text-xl text-orange-200 mb-8 leading-relaxed">
                For over 2000 years, the Newari community has preserved the culinary traditions of ancient Nepal. 
                Our recipes are not just food - they are stories, rituals, and celebrations of life itself.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full mr-4 mt-1 flex-shrink-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-800 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-yellow-400 mb-2">Ancient Recipes</h4>
                    <p className="text-orange-200">Traditional cooking methods preserved for over 20 generations</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full mr-4 mt-1 flex-shrink-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-800 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-yellow-400 mb-2">Sacred Ingredients</h4>
                    <p className="text-orange-200">Locally sourced spices and ingredients from the Himalayan region</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full mr-4 mt-1 flex-shrink-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-800 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-yellow-400 mb-2">Festival Foods</h4>
                    <p className="text-orange-200">Special dishes prepared for traditional Newari festivals and ceremonies</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://media.restroverse.app/restrobizz/MEDIALIBRARYIMG/99e89dcb-763c-3662-a1e8-23547dc84861."
                alt="Traditional Newari cooking"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-8 -right-8 bg-yellow-500 text-red-800 p-6 rounded-xl shadow-lg border-2 border-orange-300">
                <div className="text-3xl font-bold">2000+</div>
                <div className="text-sm font-bold">Years of Tradition</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-6 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-red-800 text-xl mb-4 font-bold">अब आफ्नो मनपर्ने व्यञ्जन अर्डर गर्नुहोस्</div>
          <h2 className="text-5xl font-bold text-red-800 mb-6">Experience Authentic Nepal</h2>
          <p className="text-xl text-red-700 mb-10 max-w-4xl mx-auto">
            Join us for an unforgettable journey through the flavors of ancient Kathmandu Valley. 
            Every meal is a celebration of our rich cultural heritage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to='/menu' className="bg-red-800 text-yellow-400 px-12 py-5 rounded-full text-lg font-bold hover:bg-red-700 transform hover:scale-105 transition-all duration-300 shadow-xl border-2 border-red-900">
              View Traditional Menu
            </Link>
            <Link to="/menu" className="border-3 border-red-800 text-red-800 px-12 py-5 rounded-full text-lg font-bold hover:bg-red-800 hover:text-yellow-400 transition-all duration-300 bg-white">
              Order Online
            </Link>
           
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;