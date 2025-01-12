import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../index";
import "./promotions.scss";
import { useAuth } from "../../../hooks/useAuth";
import PromotionBlock from "../../PromotionBlock";
import { Promotion } from "./promotion";

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categorySectionMap, setCategorySectionMap] = useState<
    Record<string, string>
  >({});
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const promotionsCollection = collection(db, "promotions");
      const promotionsSnapshot = await getDocs(promotionsCollection);
      const promotionsList: Promotion[] = promotionsSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
          productId: doc.data().productId || "", // Задаём значение по умолчанию
        })
      ) as Promotion[];

      const categoryNames = [
        ...new Set(promotionsList.map((p) => p.categoryName)),
      ];

      const categorySectionMap: Record<string, string> = {};

      for (const categoryName of categoryNames) {
        console.log(`Fetching category: ${categoryName}`);
        const categoryQuery = query(
          collection(db, "categories"),
          where("name", "==", categoryName)
        );
        const categorySnapshot = await getDocs(categoryQuery);

        if (!categorySnapshot.empty) {
          const categoryData = categorySnapshot.docs[0].data();
          const sectionId = categoryData.sectionId;

          if (sectionId) {
            const sectionRef = doc(db, "sections", sectionId);
            const sectionSnapshot = await getDoc(sectionRef);

            if (sectionSnapshot.exists()) {
              const sectionData = sectionSnapshot.data();
              const sectionName = sectionData.name;

              if (sectionName) {
                categorySectionMap[categoryName] = sectionName;
              } else {
                console.warn(
                  `У раздела с ID ${sectionId} отсутствует поле 'name'.`
                );
              }
            } else {
              console.warn(`Раздел с ID ${sectionId} не найден.`);
            }
          } else {
            console.warn(
              `У категории ${categoryName} отсутствует поле 'sectionId'.`
            );
          }
        } else {
          console.warn(`Категория ${categoryName} не найдена в базе данных.`);
        }
      }

      setPromotions(promotionsList);
      setCategorySectionMap(categorySectionMap);
    };

    fetchData();
  }, []);

  const groupedPromotions: Record<string, Promotion[]> = {
    Акции: [],
    Рекомендуем: [],
    "Хиты продаж": [],
    Новинки: [],
  };

  promotions.forEach((promotion) => {
    if (groupedPromotions[promotion.promotionType]) {
      groupedPromotions[promotion.promotionType].push(promotion);
    } else {
      groupedPromotions[promotion.promotionType] = [promotion];
    }
  });

  if (promotions.length === 0 || Object.keys(categorySectionMap).length === 0) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="promotions">
      {Object.keys(groupedPromotions).map((promotionType) => {
        const promotionsArray = groupedPromotions[promotionType];

        if (promotionsArray.length === 0) {
          return null;
        }

        return (
          <PromotionBlock
            key={promotionType}
            promotionType={promotionType}
            promotionsArray={groupedPromotions[promotionType].filter(
              (promo) => promo.productId !== undefined
            )}
            categorySectionMap={categorySectionMap}
            currentUser={Boolean(currentUser)}
          />
        );
      })}
    </div>
  );
}
