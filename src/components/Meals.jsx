import MealItem from "./MealItem.jsx";
import useHttp from "../hooks/useHttp.js";
import Error from "./Error.jsx";
import { API_URL } from "../config/api.js";

const requestConfig = {};

export default function Meals() {
  const {
    data: loadedMeals,
    isLoading,
    error,
  } = useHttp(`${API_URL}/meals`, requestConfig, []);

  if(isLoading){
    return <p className="center">Yiyecekler alınıyor...</p>;
  }

  if(error){
    return <Error title="Yemekler alınamadı" message={error}/>;
  }
  
  return (
    <ul id="meals">
      {loadedMeals.map((meal) => (
        <MealItem key={meal.id} meal={meal} />
      ))}
    </ul>
  );
}
