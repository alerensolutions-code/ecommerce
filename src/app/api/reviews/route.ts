import { NextResponse } from 'next/server';

const FALLBACK_REVIEWS = {
  rating: 5.0,
  reviews: [
    {
      user: { name: "Waldemar Perez" },
      rating: 5,
      snippet: "Excelente atención. No tienen por qué desconfiar, compren con seguridad que por algo tiene muchísimas reseñas positivas. Le compré una rx6800xt full box, con los sellos de seguridad que nunca fue abierta. Le..."
    },
    {
      user: { name: "Leito \"Black\" Maldonado" },
      rating: 5,
      snippet: "No serán las mejores fotos y hay mucho que acomodar pero lo prometido es deuda. La verdad la atención 10 puntos, maxi un genio gracias por el aguante y la paciencia, gente super confiable no duden. Suerte co..."
    },
    {
      user: { name: "Agus Reds" },
      rating: 5,
      snippet: "La placa en 2 dias ya la tenia en el correo bien embalada e impecable. Me mando mil videos de test y la estoy usando para jugar todo en ultra anda perfecto!"
    }
  ]
};

export async function GET() {
  try {
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      console.warn("SERPAPI_KEY is not defined in environment variables. Returning fallback reviews.");
      return NextResponse.json(FALLBACK_REVIEWS);
    }

    const placeId = "ChIJgbHnOUy5vJURLGVmBUYV61Y";
    const url = `https://serpapi.com/search.json?engine=google_maps_reviews&place_id=${placeId}&api_key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 86400 } // Cache results for 24 hours (1 search per day)
    });

    if (!res.ok) {
      throw new Error(`SerpApi request failed with status: ${res.status}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const rating = data.place_info?.rating || 5.0;
    const rawReviews = data.reviews || [];

    const formattedReviews = rawReviews.slice(0, 3).map((r: any) => ({
      user: {
        name: r.user?.name || "Usuario de Google"
      },
      rating: r.rating || 5,
      snippet: r.snippet || "",
    }));

    if (formattedReviews.length === 0) {
      return NextResponse.json(FALLBACK_REVIEWS);
    }

    return NextResponse.json({
      rating,
      reviews: formattedReviews,
      reviewsCount: data.place_info.reviews || 0,
    });
  } catch (error) {
    console.error("Error fetching reviews from SerpApi, returning fallback reviews:", error);
    return NextResponse.json(FALLBACK_REVIEWS);
  }
}
