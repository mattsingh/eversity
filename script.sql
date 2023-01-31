create table universities
(
    id             serial
        primary key,
    name           varchar(255) not null,
    description    varchar(255) not null,
    num_students   integer      not null,
    location       point        not null,
    domain         varchar(255) not null,
    created_at     timestamp default now(),
    super_admin_id integer      not null
);

alter table universities
    owner to xuotfpovppcydd;

create table users
(
    id            serial
        primary key,
    name          varchar(255)        not null,
    email         varchar(255)        not null,
    password      varchar(255)        not null,
    auth_level    integer   default 0 not null
        constraint auth_level
            check ((auth_level >= 0) AND (auth_level <= 2)),
    university_id integer             not null
        references universities,
    created_at    timestamp default CURRENT_TIMESTAMP
);

alter table users
    owner to xuotfpovppcydd;

alter table universities
    add foreign key (super_admin_id) references users;

create table rsos
(
    id            serial
        primary key,
    name          varchar(255)            not null,
    description   varchar(255)            not null,
    approved      boolean   default false not null,
    created_at    timestamp default now(),
    university_id integer                 not null
        references universities,
    admin_id      integer                 not null
        references users
);

alter table rsos
    owner to xuotfpovppcydd;

create table member_of
(
    user_id integer not null
        references users,
    rso_id  integer not null
        references rsos,
    primary key (user_id, rso_id)
);

alter table member_of
    owner to xuotfpovppcydd;

create table events
(
    id            serial
        primary key,
    name          varchar(255)            not null,
    description   text                    not null,
    type          integer                 not null
        constraint event_type_check
            check ((type >= 0) AND (type <= 2)),
    approved      boolean   default false not null,
    rso_id        integer
        references rsos,
    location      point                   not null,
    date          timestamp               not null,
    contact_phone varchar(20)             not null,
    contact_email varchar(255)            not null,
    created_at    timestamp default now() not null,
    creator_id    integer                 not null
        references users
);

alter table events
    owner to xuotfpovppcydd;

create table comments
(
    id         serial
        primary key,
    text       varchar(2000)           not null,
    user_id    integer                 not null
        references users,
    event_id   integer                 not null
        references events,
    rating     integer                 not null,
    created_at timestamp default now() not null
);

alter table comments
    owner to xuotfpovppcydd;

create table pictures
(
    id            serial
        primary key,
    name          varchar(255),
    image         bytea,
    type          integer   default 0 not null
        constraint pictures_type_check
            check ((type >= 0) AND (type <= 1)),
    event_id      integer
        references events,
    university_id integer
        references universities,
    created_at    timestamp default CURRENT_TIMESTAMP
);

alter table pictures
    owner to xuotfpovppcydd;


