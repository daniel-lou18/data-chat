import { dvfPropertySales } from "../tables/dvfPropertySales";
import { PropertySales } from "../lib/validators";

export const transformDvfToPropertySales = (
  mutations: dvfPropertySales[]
): PropertySales[] => {
  return mutations.map((mutation) => ({
    id: mutation._id,
    inseeCode: mutation.l_codinsee,
    section: mutation.l_section,
    year: mutation.anneemut,
    month: mutation.moismut,
    date: mutation.datemut,
    mutationType: mutation.libnatmut,
    propertyType: mutation.libtypbien,
    price: mutation.valeurfonc,
    floorArea: mutation.sbati,
    numberOfStudioApartments: mutation.nbapt1pp,
    numberOf1BedroomApartments: mutation.nbapt2pp,
    numberOf2BedroomApartments: mutation.nbapt3pp,
    numberOf3BedroomApartments: mutation.nbapt4pp,
    numberOf4BedroomApartments: mutation.nbapt5pp,
    numberOfWorkspaces: mutation.nblocapt,
    numberOfAppartments: mutation.nblocdep,
    numberOfHouses: mutation.nblocmai,
    numberOfSecondaryUnits: mutation.nblocdep,
    numberOfStudioHouses: mutation.nbmai1pp,
    numberOf1BedroomHouses: mutation.nbmai2pp,
    numberOf2BedroomHouses: mutation.nbmai3pp,
    numberOf3BedroomHouses: mutation.nbmai4pp,
    numberOf4BedroomHouses: mutation.nbmai5pp,
  }));
};
