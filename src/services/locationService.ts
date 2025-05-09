
/**
 * Service for handling geolocation functionality
 */

interface AddressResult {
  bairro: string;
  rua: string;
}

/**
 * Gets address information from geographical coordinates
 */
export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<AddressResult> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) throw new Error('Falha ao obter endereço');
    
    const data = await response.json();
    
    // Extract address information
    const address = data.address || {};
    
    // Try to find neighborhood (neighbourhood, suburb or district)
    const bairro = address.neighbourhood || address.suburb || address.district || '';
    
    // Try to find street (road, street or path)
    const rua = address.road || address.street || address.path || '';
    
    return { bairro, rua };
  } catch (error) {
    console.error('Erro ao obter endereço:', error);
    return { bairro: '', rua: '' };
  }
};

/**
 * Gets current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não é suportada pelo seu navegador'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};
