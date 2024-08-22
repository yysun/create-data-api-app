IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[UserProfile]') AND type in (N'U')) DROP TABLE [dbo].[UserProfile];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[webpages_Membership]') AND type in (N'U')) DROP TABLE [dbo].[webpages_Membership];
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[webpages_Roles]') AND type in (N'U')) DROP TABLE [dbo].[webpages_Roles];

CREATE TABLE [dbo].[UserProfile](
  [UserId] [int] IDENTITY(1,1) NOT NULL,
  [Email] [nvarchar](56) NOT NULL
) ON [PRIMARY];

CREATE TABLE [dbo].[webpages_Membership](
  [UserId] [int] NOT NULL,
  [CreateDate] [datetime] NULL,
  [ConfirmationToken] [nvarchar](128) NULL,
  [IsConfirmed] [bit] NULL,
  [LastPasswordFailureDate] [datetime] NULL,
  [PasswordFailuresSinceLastSuccess] [int] NOT NULL,
  [Password] [nvarchar](128) NOT NULL,
  [PasswordChangedDate] [datetime] NULL,
  [PasswordSalt] [nvarchar](128) NOT NULL,
  [PasswordVerificationToken] [nvarchar](128) NULL,
  [PasswordVerificationTokenExpirationDate] [datetime] NULL
) ON [PRIMARY];

CREATE TABLE [dbo].[webpages_Roles](
  [RoleId] [int] IDENTITY(1,1) NOT NULL,
  [RoleName] [nvarchar](256) NOT NULL
) ON [PRIMARY];

Insert into [dbo].[UserProfile] (Email) Values ('admin@company.com');
Insert into [dbo].[UserProfile] (Email) Values ('user@company.com');

Insert into [dbo].[webpages_Roles] (RoleName) Values ('Sysadmin');
Insert into [dbo].[webpages_Roles] (RoleName) Values ('Admin');
Insert into [dbo].[webpages_Roles] (RoleName) Values ('User');

CREATE PROCEDURE [dbo].[GetAllUserInfo] AS
BEGIN
  SET NOCOUNT ON;
  select * from dbo.UserProfile
  select * from dbo.webpages_Membership
  select * from dbo.webpages_Roles
END