import fetch from 'node-fetch';

const testAPI = async () => {
  try {
    console.log('🌐 Testing Events API endpoint...\n');

    const response = await fetch('http://localhost:5000/api/v1/events');
    const data = await response.json();

    console.log('📡 API Response Status:', response.status);
    console.log('📊 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.data.events) {
      console.log(`\n✅ Found ${data.data.events.length} events in API response`);
      data.data.events.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.title} - ${event.category} - ${event.date}`);
      });
    } else {
      console.log('❌ No events found in API response');
    }

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    console.log('\n💡 Make sure the backend server is running on port 5000');
  }
};

testAPI();