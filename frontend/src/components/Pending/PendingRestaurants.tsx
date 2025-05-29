import { Table } from "@chakra-ui/react"
import { SkeletonText } from "../ui/skeleton"

const PendingRestaurants = () => (
  <Table.Root size={{ base: "sm", md: "md" }}>
    <Table.Header>
      <Table.Row>
        <Table.ColumnHeader w="sm">ID</Table.ColumnHeader>
        <Table.ColumnHeader w="sm">Name</Table.ColumnHeader>
        <Table.ColumnHeader w="sm">Revo Tenant</Table.ColumnHeader>
        <Table.ColumnHeader w="sm">Revo Client Key</Table.ColumnHeader>
        <Table.ColumnHeader w="sm">Revo API Key</Table.ColumnHeader>
        <Table.ColumnHeader w="sm">Actions</Table.ColumnHeader>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {[...Array(5)].map((_, index) => (
        <Table.Row key={index}>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
          <Table.Cell>
            <SkeletonText noOfLines={1} />
          </Table.Cell>
        </Table.Row>
      ))}
    </Table.Body>
  </Table.Root>
)

export default PendingRestaurants
