import {
    Sprout, TreePine, Skull, Pause, 
    type LucideIcon
} from "lucide-react";

const statusIcons: Record<string, LucideIcon> = {
    "IN_PROGRESS": Sprout,
    "COMPLETED": TreePine,
    "ABANDONED": Skull,
    "PAUSED": Pause,
}

export const StatusIcon = ({ name, size }: { name: string, size: number }) => {
    const Icon = statusIcons[name];
    return <Icon size={size} />
}
