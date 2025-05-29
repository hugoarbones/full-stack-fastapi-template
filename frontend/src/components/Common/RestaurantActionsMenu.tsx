import { IconButton } from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { MenuContent, MenuRoot, MenuTrigger } from "../ui/menu"

import type { RestaurantPublic } from "@/client"
import DeleteRestaurant from "../Restaurants/DeleteRestaurant"
import EditRestaurant from "../Restaurants/EditRestaurant"

interface RestaurantActionsMenuProps {
  restaurant: RestaurantPublic
}

export const RestaurantActionsMenu = ({ restaurant }: RestaurantActionsMenuProps) => {
  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton variant="ghost" color="inherit">  
          <BsThreeDotsVertical />
        </IconButton>
      </MenuTrigger>
      <MenuContent>
        <EditRestaurant restaurant={restaurant} />
        <DeleteRestaurant id={restaurant.id} />
      </MenuContent>
    </MenuRoot>
  )
}
