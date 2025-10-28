import { _clause } from "@/constants/types";
import { Button, Group, Stack, Text } from "@mantine/core";

const ModalClause = ({
  original,
  incoming,
  handleSelect,
}: {
  original: _clause;
  incoming: _clause;
  handleSelect: (clause: _clause) => void;
}) => {
  return (
    <Stack>
      <Text size="lg" fw="bold">
        {original.title}:
      </Text>
      <Group align="flex-start">
        <Stack flex={1}>
          <Text size="lg" fw="bold">
            Original clause
          </Text>
          <Text w="35vw">{original.content}</Text>
          <Button variant="light" onClick={() => handleSelect(original)}>
            Keep original clause
          </Button>
        </Stack>
        <Stack flex={1}>
          <Text size="lg" fw="bold">
            Incoming clause
          </Text>
          <Text w="35vw">{incoming.content}</Text>
          {incoming.content && incoming.content.length > 0 && (
            <Button variant="outline" onClick={() => handleSelect(incoming)}>
              Accept incoming clause
            </Button>
          )}
        </Stack>
      </Group>
    </Stack>
  );
};

export default ModalClause;
