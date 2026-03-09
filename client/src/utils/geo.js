export function kmBetween([lat1,lng1],[lat2,lng2]) {
  const toR = d => d*Math.PI/180, R = 6371;
  const dLat = toR(lat2-lat1), dLng = toR(lng2-lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toR(lat1))*Math.cos(toR(lat2))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
