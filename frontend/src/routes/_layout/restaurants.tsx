import {
  Container,
  EmptyState,
  Flex,
  Heading,
  Table,
  VStack,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { FiSearch } from "react-icons/fi"
import { z } from "zod"

import { RestaurantsService } from "@/client"
import { RestaurantActionsMenu } from "@/components/Common/RestaurantActionsMenu"
import AddRestaurant from "@/components/Restaurants/AddRestaurant"
import PendingRestaurants from "@/components/Pending/PendingRestaurants"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const restaurantsSearchSchema = z.object({
  page: z.number().catch(1),
})

const PER_PAGE = 5

function getRestaurantsQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      RestaurantsService.readRestaurants({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["restaurants", { page }],
  }
}

export const Route = createFileRoute("/_layout/restaurants")({
  component: Restaurants,
  validateSearch: (search) => restaurantsSearchSchema.parse(search),
})

function RestaurantsTable() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getRestaurantsQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const restaurants = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingRestaurants />
  }

  if (restaurants.length === 0) {
    return (
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiSearch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>You don't have any restaurants yet</EmptyState.Title>
            <EmptyState.Description>
              Add a new restaurant to get started
            </EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    )
  }

  return (
    <>
      <Table.Root size={{ base: "sm", md: "md" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Title</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Description</Table.ColumnHeader>
            <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {restaurants?.map((restaurant) => (
            <Table.Row key={restaurant.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <Table.Cell truncate maxW="sm">
                {restaurant.id}
              </Table.Cell>
              <Table.Cell truncate maxW="sm">
                {restaurant.title}
              </Table.Cell>
              <Table.Cell
                color={!restaurant.description ? "gray" : "inherit"}
                truncate
                maxW="30%"
              >
                {restaurant.description || "N/A"}
              </Table.Cell>
              <Table.Cell>
                <RestaurantActionsMenu restaurant={restaurant} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </>
  )
}

function Restaurants() {
  return (
    <Container maxW="full">
      <Heading size="lg" pt={12}>
        Restaurants Management
      </Heading>
      <AddRestaurant />
      <RestaurantsTable />
    </Container>
  )
}
