export const canGivenRolesHaveAccess = (allowedRoles, useRoles) => {
    let hasAccess = false;

    useRoles.forEach(role => {
        if(allowedRoles.includes(role.name)){
            hasAccess = true;
        }
    });

    return hasAccess;
}