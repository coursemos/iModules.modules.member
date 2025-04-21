<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 계정 구조체를 정의한다.
 *
 * @file /modules/member/dtos/OAuthAccount.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2025. 4. 21.
 */
namespace modules\member\dtos;
class OAuthAccount
{
    /**
     * @var \modules\member\dtos\OAuthClient $_client OAuth클라이언트
     */
    private \modules\member\dtos\OAuthClient $_client;

    /**
     * @var \OAuthClient $_oauth OAuth 클라이언트 클래스
     */
    private \OAuthClient $_oauth;

    /**
     * @var ?object $_user OAuth 유저정보 RAW 데이터
     */
    private ?object $_user;

    /**
     * @var ?string $_id OAuth 유저고유값
     */
    private ?string $_id;

    /**
     * @var ?string $_email OAuth 유저이메일
     */
    private ?string $_email;

    /**
     * @var ?string $_name OAuth 유저성명
     */
    private ?string $_name;

    /**
     * @var ?string $_nickname OAuth 유저닉네임
     */
    private ?string $_nickname;

    /**
     * @var ?string $_photo OAuth 유저사진
     */
    private ?string $_photo;

    /**
     * @var ?string $_id OAuth 계정과 연결된 회원고유값
     */
    private array $_linked_member_ids;

    /**
     * OAuth클라이언트 구조체를 정의한다.
     *
     * @param \modules\member\dtos\OAuthClient $client OAuth클라이언트
     * @param \OAuthClient $_oauth OAuth클래스
     */
    public function __construct(\modules\member\dtos\OAuthClient $client, \OAuthClient $_oauth)
    {
        $this->_client = $client;
        $this->_oauth = $_oauth;
    }

    /**
     * 게정에 연계된 OAuth 클라이언트 정보를 가져온다.
     *
     * @return \modules\member\dtos\OAuthClient $client OAuth 클라이언트
     */
    public function getClient(): \modules\member\dtos\OAuthClient
    {
        return $this->_client;
    }

    /**
     * 게정에 연계된 OAuth 클라이언트 클래스를 가져온다.
     *
     * @return \OAuthClient $oauth OAuth 클라이언트 클래스
     */
    public function getOAuth(): \OAuthClient
    {
        return $this->_oauth;
    }

    /**
     * 액세스토큰을 가져온다.
     *
     * @return string $access_token
     */
    public function getAccessToken(): ?string
    {
        return $this->_oauth->getAccessToken();
    }

    /**
     * 현재 액세스토큰의 요청범위를 가져온다.
     *
     * @return ?string $scope
     */
    public function getAccessTokenScope(): ?string
    {
        return $this->_oauth->getOAuthSession()?->scope ?? null;
    }

    /**
     * 현재 액세스토큰의 요청범위를 가져온다.
     *
     * @return ?string $scope
     */
    public function getAccessTokenUserScope(): ?string
    {
        return $this->_oauth->getOAuthSession()?->user_scope ?? null;
    }

    /**
     * 현재 액세스토큰의 만료일시를 가져온다.
     *
     * @return int $expired_at
     */
    public function getAccessTokenExpiredAt(): int
    {
        return $this->_oauth->getOAuthSession()?->expired_at ?? 0;
    }

    /**
     * 갱신토큰을 가져온다.
     *
     * @return string $access_token
     */
    public function getRefreshToken(): ?string
    {
        $session = $this->_oauth->getOAuthSession();
        return $session?->refresh_token ?? null;
    }

    /**
     * OAuth 유저정보 RAW 데이터를 가져온다.
     *
     * @return ?object $user
     */
    public function getUser(): ?object
    {
        if (isset($this->_user) == false) {
            $this->_user = $this->_oauth->get($this->_client->getUserUrl());
        }

        return $this->_user;
    }

    /**
     * OAuth 유저정보 RAW 데이터를 지정한다.
     *
     * @param ?object $user
     */
    public function setUser(?object $user): \modules\member\dtos\OAuthAccount
    {
        $this->_user = $user;
        return $this;
    }

    /**
     * OAuth 계정 고유값을 가져온다.
     *
     * @return ?string $id
     */
    public function getId(): ?string
    {
        if (isset($this->_id) == false) {
            $user = $this->getUser();
            $this->_id = $this->_oauth->getJson($user, $this->_client->getUserIdPath());
        }

        return $this->_id;
    }

    /**
     * OAuth 계정 이메일주소를 가져온다.
     *
     * @return ?string $email
     */
    public function getEmail(): ?string
    {
        if (isset($this->_email) == false) {
            $user = $this->getUser();
            $this->_email = $this->_oauth->getJson($user, $this->_client->getUserEmailPath());
        }

        return $this->_email;
    }

    /**
     * OAuth 계정 유저명 가져온다.
     *
     * @return ?string $name
     */
    public function getName(): ?string
    {
        if (isset($this->_name) == false) {
            $user = $this->getUser();
            $this->_name = $this->_oauth->getJson($user, $this->_client->getUserNamePath());

            if ($this->_name === null) {
                $email = explode('@', $this->getEmail() ?? 'unknown@unknown.com');
                $this->_name = $email[0];
            }
        }

        return $this->_name;
    }

    /**
     * OAuth 계정 닉네임을 가져온다.
     *
     * @return ?string $nickname
     */
    public function getNickname(): ?string
    {
        if (isset($this->_nickname) == false) {
            $user = $this->getUser();
            $this->_nickname = $this->_oauth->getJson($user, $this->_client->getUserNicknamePath());
            $this->_nickname ??= $this->getName();
        }

        return $this->_nickname;
    }

    /**
     * OAuth 계정 사진을 가져온다.
     *
     * @return ?string $photo
     */
    public function getPhoto(): ?string
    {
        if (isset($this->_photo) == false) {
            $user = $this->getUser();
            $this->_photo = $this->_oauth->getJson($user, $this->_client->getUserPhotoPath());
        }

        return $this->_photo;
    }

    /**
     * OAuth 계정과 연결된 회원고유값을 가져온다.
     *
     * @return int[] $member_ids
     */
    public function getLinkedMemberIds(): array
    {
        if (isset($this->_linked_member_ids) == false) {
            /**
             * @var \modules\member\Member $mMember
             */
            $mMember = \Modules::get('member');
            $this->_linked_member_ids = $mMember
                ->db()
                ->select()
                ->from($mMember->table('oauth_tokens'))
                ->where('oauth_id', $this->_client->getId())
                ->where('user_id', $this->getId())
                ->get('member_id');
        }

        return $this->_linked_member_ids;
    }

    /**
     * OAuth 계정과 연결될 수 있는 회원고유값을 가져온다.
     * 토큰정보가 이미 등록되어 있거나, OAuth 계정의 이메일주소와 동일한 계정이 제안됩니다.
     *
     * @return int $suggested_member_id
     */
    public function getSuggestedMemberId(): int
    {
        /**
         * @var \modules\member\Member $mMember
         */
        $mMember = \Modules::get('member');

        $member_ids = $this->getLinkedMemberIds();
        $email = $mMember
            ->db()
            ->select()
            ->from($mMember->table('members'))
            ->where('email', $this->getEmail())
            ->getOne();
        if (count($member_ids) == 0) {
            return $email?->member_id ?? 0;
        } elseif (count($member_ids) == 1) {
            return $member_ids[0];
        } else {
            if (in_array($email?->member_id ?? 0, $member_ids) == true) {
                return $email->member_id;
            } else {
                return $member_ids[0];
            }
        }
    }

    /**
     * OAuth 계정정보가 유효한지 확인한다.
     *
     * @return bool $valid
     */
    public function isValid(): bool
    {
        if ($this->getAccessToken() === null || $this->getId() === null || $this->getEmail() === null) {
            return false;
        }

        return true;
    }
}
