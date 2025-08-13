// Utility to quickly add photos to all people - run this once to update the data
import defaultProfile from '../assets/default-profile.jpg';

export const addPhotoToAllPeople = (peopleData: string) => {
  // This utility helps update the data file by adding photo: defaultProfile to all people
  // Use this in development to quickly update the organigrammeData.ts file
  
  const lines = peopleData.split('\n');
  const updatedLines = lines.map(line => {
    if (line.trim().startsWith('description:') && line.includes("'")) {
      return line + ',\n    photo: defaultProfile';
    }
    return line;
  });
  
  return updatedLines.join('\n');
};

// Just for development - you can delete this file after updating the data