import {
  Button,
  ButtonGroup,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FaExchangeAlt } from "react-icons/fa"

import {
  type ApiError,
  type RestaurantPublic,
  RestaurantsService,
} from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  DialogActionTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface EditRestaurantProps {
  restaurant: RestaurantPublic
}

interface RestaurantUpdateForm {
  name: string
  revo_tenant?: string
  revo_client_key?: string
  revo_api_key?: string
}

const EditRestaurant = ({ restaurant }: EditRestaurantProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      ...restaurant,
      revo_tenant: restaurant.revo_tenant ?? undefined,
      revo_client_key: restaurant.revo_client_key ?? undefined,
      revo_api_key: restaurant.revo_api_key ?? undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RestaurantUpdateForm) =>
      RestaurantsService.updateRestaurant({ id: restaurant.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Restaurant updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] })
    },
  })

  const onSubmit: SubmitHandler<RestaurantUpdateForm> = (data) => {
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      placement="center"
      open={isOpen}
      onOpenChange={({ open }) => setIsOpen(open)}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <FaExchangeAlt fontSize="16px" />
          Edit Restaurant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the restaurant details below.</Text>
            <VStack gap={4}>
              <Field
                required
                invalid={!!errors.name}
                errorText={errors.name?.message}
                label="Name"
              >
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                  })}
                  placeholder="Name"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.revo_tenant}
                errorText={errors.revo_tenant?.message}
                label="Revo Tenant"
              >
                <Input
                  id="revo_tenant"
                  {...register("revo_tenant")}
                  placeholder="Revo Tenant"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.revo_client_key}
                errorText={errors.revo_client_key?.message}
                label="Revo Client Key"
              >
                <Input
                  id="revo_client_key"
                  {...register("revo_client_key")}
                  placeholder="Revo Client Key"
                  type="text"
                />
              </Field>

              <Field
                invalid={!!errors.revo_api_key}
                errorText={errors.revo_api_key?.message}
                label="Revo API Key"
              >
                <Input
                  id="revo_api_key"
                  {...register("revo_api_key")}
                  placeholder="Revo API Key"
                  type="text"
                />
              </Field>
            </VStack>
          </DialogBody>

          <DialogFooter gap={2}>
            <ButtonGroup>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" type="submit" loading={isSubmitting}>
                Save
              </Button>
            </ButtonGroup>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default EditRestaurant
