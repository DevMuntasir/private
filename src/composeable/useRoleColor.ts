const badgeColors = [
  "bg-red-100 text-red-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-indigo-100 text-indigo-700",
  "bg-teal-100 text-teal-700",
  "bg-pink-100 text-pink-700",
  "bg-orange-100 text-orange-700",
  "bg-gray-100 text-gray-700",
];

function hashStringToColorIndex(str: string, colorCount: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colorCount;
}

export function useRoleColor() {
  function getRoleBadgeColor(roleName: string): string {
    const index = hashStringToColorIndex(roleName, badgeColors.length);
    return `px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[index]}`;
  }

  return {
    getRoleBadgeColor,
  };
}
