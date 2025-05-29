import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  Button,
  DialogActionTrigger,
  DialogTitle,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"

import { type RestaurantCreate, RestaurantsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

const AddRestaurant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RestaurantCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      revo_tenant: "",
      revo_client_key: "",
      revo_api_key: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: RestaurantCreate) =>
      RestaurantsService.createRestaurant({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Restaurant created successfully.")
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

  const onSubmit: SubmitHandler<RestaurantCreate> = (data) => {
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
        <Button value="add-restaurant" my={4}>
          <FaPlus fontSize="16px" />
          Add Restaurant
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Restaurant</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Fill in the details to add a new restaurant.</Text>
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
                    required: "Name is required.",
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
            <DialogActionTrigger asChild>
              <Button
                variant="subtle"
                colorPalette="gray"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              variant="solid"
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default AddRestaurant
