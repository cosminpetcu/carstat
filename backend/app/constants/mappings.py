DRIVE_TYPE_MAPPING = {
    "Masina de oras": "Hatchback",
    "Masina mica": "Hatchback",
    "Compacta": "Hatchback",
    "Hatchback": "Hatchback",
    "Berlina": "Sedan",
    "Sedan": "Sedan",
    "Break": "Wagon",
    "Combi": "Wagon",
    "SUV": "SUV",
    "Off-road": "SUV",
    "Monovolum": "MPV",
    "Minibus": "MPV",
    "Coupe": "Coupe",
    "Cabrio": "Convertible",
    "Pickup": "Pickup"
}

FUEL_TYPE_MAPPING = {
    "Diesel": "Diesel",
    "Benzina": "Petrol",
    "Hibrid": "Hybrid",
    "Hibrid Plug-In": "Plug-in Hybrid",
    "Plug-In Hybrid": "Plug-in Hybrid",
    "GPL": "LPG",
    "Benzina + GPL": "LPG",
    "Electric": "Electric",
    "Benzina + CNG": "CNG"
}

TRANSMISSION_MAPPING = {
    "Manuala": "Manual",
    "Manual": "Manual",
    "Automata": "Automatic",
    "Automatic": "Automatic"
}

VEHICLE_CONDITION_MAPPING = {
    "Nou": "New",
    "New": "New",
    "Utilizat": "Used", 
    "Used": "Used"
}

COLOR_MAPPING = {
    "Negru": "Black",
    "Black": "Black",
    "Gri": "Grey",
    "Grey": "Grey",
    "Gray": "Grey",
    "Alb": "White",
    "White": "White",
    "Albastru": "Blue",
    "Blue": "Blue",
    "Rosu": "Red",
    "Red": "Red",
    "Argintiu": "Silver",
    "Argint": "Silver",
    "Silver": "Silver",
    "Maro / Bej": "Brown",
    "Maro": "Brown",
    "Brown": "Brown",
    "Bej": "Beige",
    "Beige": "Beige",
    "Verde": "Green",
    "Green": "Green",
    "Galben / Auriu": "Yellow/Gold",
    "Galben/Auriu": "Yellow/Gold",
    "Yellow": "Yellow/Gold",
    "Gold": "Yellow/Gold",
    "Portocaliu": "Orange",
    "Orange": "Orange",
    "Alta culoare": "Other",
    "Alte culori": "Other",
    "Other": "Other"
}

EMISSION_STANDARD_MAPPING = {
    "Euro 1": "Euro 1",
    "Euro 2": "Euro 2",
    "Euro 3": "Euro 3",
    "Euro 4": "Euro 4",
    "Euro 5": "Euro 5",
    "Euro 5a": "Euro 5",
    "Euro 5b": "Euro 5",
    "Euro 6": "Euro 6",
    "Euro 6b": "Euro 6",
    "Euro 6c": "Euro 6",
    "Euro 6d": "Euro 6",
    "Euro 6d-Temp": "Euro 6",
    "Non-euro": "Non-euro"
}
def standardize_emission_standard(standard):
    if not standard:
        return None
    return EMISSION_STANDARD_MAPPING.get(standard, standard)

def standardize_color(color):
    if not color:
        return None
    return COLOR_MAPPING.get(color, color)

def standardize_vehicle_condition(condition):
    if not condition:
        return None
    return VEHICLE_CONDITION_MAPPING.get(condition, condition)

def standardize_transmission(transmission):
    if not transmission:
        return None
    return TRANSMISSION_MAPPING.get(transmission, transmission)

def standardize_drive_type(drive_type):
    if not drive_type:
        return None
    return DRIVE_TYPE_MAPPING.get(drive_type, drive_type)

def standardize_fuel_type(fuel_type):
    if not fuel_type:
        return None
    return FUEL_TYPE_MAPPING.get(fuel_type, fuel_type)