export type Position = { x: number; y: number };

export type Rect = { left: number; top: number; right: number; bottom: number };

export const findNearestPoint = <T extends Position>(
    points: T[],
    target: Position,
    maxDistance: number
) => {
    return points.reduce<null | { point: T; distance: number }>(
        (nearestPoint, point) => {
            const distance = Math.sqrt(
                (point.x - target.x) ** 2 + (point.y - target.y) ** 2
            );

            if (distance > maxDistance) return nearestPoint;
            if (nearestPoint === null || distance < nearestPoint.distance)
                return { point, distance };
            return nearestPoint;
        },
        null
    )?.point;
};

export const isInsideRect = (rect: Rect, point: Position, margin: number) => {
    const isInside =
        point.y > rect.top - margin &&
        point.x > rect.left - margin &&
        point.x < rect.right + margin &&
        point.y < rect.bottom + margin;

    return isInside;
};
