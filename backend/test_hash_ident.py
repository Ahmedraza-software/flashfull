from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

hashes = [
    "$pbkdf2-sha256$29000$d46x1nqP0VpLybkXgvBeSw$9rF/xo",
    "$pbkdf2-sha256$29000$K8W4d86ZE0Io5dzbmzPGuA$KeZvC6",
]

for h in hashes:
    try:
        print(f"Testing hash: {h}")
        # Note: we don't need the full hash to check if it's identified
        # but let's see if identify works
        ident = pwd_context.identify(h)
        print(f"Identified as: {ident}")
    except Exception as e:
        print(f"Error identifying {h}: {e}")
