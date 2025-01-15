const universities = [
    {
      id: 1,
      name: 'Ahsanullah University of Science and Technology',
      shortName: 'AUST',
      location: 'Dhaka',
      type: 'Private'
    },
    {
      id: 2,
      name: 'American International University-Bangladesh',
      shortName: 'AIUB',
      location: 'Dhaka',
      type: 'Private'
    },
    {
      id: 3,
      name: 'Bangladesh Agricultural University',
      shortName: 'BAU',
      location: 'Mymensingh',
      type: 'Public'
    },
    {
      id: 4,
      name: 'Bangladesh University of Engineering & Technology',
      shortName: 'BUET',
      location: 'Dhaka',
      type: 'Public'
    },
    {
      id: 5,
      name: 'BRAC University',
      shortName: 'BRACU',
      location: 'Dhaka',
      type: 'Private'
    },
    {
      id: 6,
      name: 'Chittagong University of Engineering & Technology',
      shortName: 'CUET',
      location: 'Chittagong',
      type: 'Public'
    },
    {
      id: 7,
      name: 'Daffodil International University',
      shortName: 'DIU',
      location: 'Dhaka',
      type: 'Private'
    },
    {
      id: 8,
      name: 'Dhaka University',
      shortName: 'DU',
      location: 'Dhaka',
      type: 'Public'
    },
    {
      id: 9,
      name: 'United International University',
      shortName: 'UIU',
      location: 'Dhaka',
      type: 'Private'
    }
    // Add more universities as needed
  ];
  
  // Sort universities alphabetically by name
  const sortedUniversities = [...universities].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  export const getUniversities = () => sortedUniversities;
  
  export const searchUniversities = (query) => {
    const searchTerm = query.toLowerCase();
    return sortedUniversities.filter(uni =>
      uni.name.toLowerCase().includes(searchTerm) ||
      uni.shortName.toLowerCase().includes(searchTerm)
    );
  };
  
  export default universities;