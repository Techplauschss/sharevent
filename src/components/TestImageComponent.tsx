'use client';

import { useState, useEffect } from 'react';

export function TestImageComponent() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const testUrl = "https://pub-0651cfbeddb14d3ba54429ab6510dc49.r2.dev/events/cmenb4y1800015kon59jc6v19/photos/1755898183996-prv7fxztb5p.jpg";
  
  return (
    <div className="p-4 border rounded-lg m-4">
      <h3 className="text-lg font-bold mb-2">Image Test</h3>
      <p className="text-sm text-gray-600 mb-4">Testing R2 image loading</p>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Test 1: Regular img tag */}
        <div className="border p-2">
          <h4 className="text-sm font-semibold mb-2">Regular img</h4>
          <div className="w-32 h-32 bg-gray-100 border">
            <img 
              src={testUrl}
              alt="Test"
              className="w-full h-full object-cover"
              onLoad={() => console.log('Regular img loaded')}
              onError={() => console.log('Regular img failed')}
            />
          </div>
        </div>
        
        {/* Test 2: img with crossOrigin */}
        <div className="border p-2">
          <h4 className="text-sm font-semibold mb-2">With CORS</h4>
          <div className="w-32 h-32 bg-gray-100 border">
            <img 
              src={testUrl}
              alt="Test"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onLoad={() => console.log('CORS img loaded')}
              onError={() => console.log('CORS img failed')}
            />
          </div>
        </div>
        
        {/* Test 3: img with referrerPolicy */}
        <div className="border p-2">
          <h4 className="text-sm font-semibold mb-2">No referrer</h4>
          <div className="w-32 h-32 bg-gray-100 border">
            <img 
              src={testUrl}
              alt="Test"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onLoad={() => console.log('No-referrer img loaded')}
              onError={() => console.log('No-referrer img failed')}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Test URL:</h4>
        <p className="text-xs break-all bg-gray-100 p-2 rounded">{testUrl}</p>
      </div>
    </div>
  );
}
