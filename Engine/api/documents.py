from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVector,
)
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from system.models import RestaurantMenu
from api.serializers import RestaurantMenuSerializer
from django.http import JsonResponse
import json


class SearchEngine(APIView):
    def get(self, request):
        query = self.request.query_params.get("query")
        search_vector = SearchVector("menu_name", weight="A") + SearchVector(
            "ingredients", "category", "description"
        )
        search_query = SearchQuery(query, search_type="websearch")
        search_rank = SearchRank(search_vector, search_query)

        restaurants = (
            RestaurantMenu.objects.filter(
                Q(menu_name__icontains=query) | Q(description__icontains=query)
            )
            .annotate(search=search_vector, rank=search_rank)
            .order_by("-rank")
        )

        serializers = RestaurantMenuSerializer(restaurants, many=True)
        return JsonResponse(data=serializers.data, safe=False)

        # search_headline = SearchHeadline

        # restaurants = (
        #     RestaurantMenu.objects.filter(
        #         Q(menu_name__icontains=query) | Q(description__icontains=query)
        #     )
        #     .annotate(
        #         search=search_vector, rank=SearchRank(search_vector, search_query)
        #     )
        #     .filter(rank__gte=0.01)
        #     .order_by("-rank")
        # )
