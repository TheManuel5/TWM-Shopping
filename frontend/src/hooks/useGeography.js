import useCollection from './useCollection'
export default function useGeography() {
  const [data] = useCollection('geography', { regions: [], provinces: [], communes: [] })
  return Object.fromEntries(data.regions.map(region => [region.nombre, Object.fromEntries(data.provinces.filter(province => province.id_region === region.id).map(province => [province.nombre, data.communes.filter(commune => commune.id_provincia === province.id).map(commune => commune.nombre)]))]))
}
